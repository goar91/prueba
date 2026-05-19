import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppData, useAuth } from '../../context/AppContext';
import { Cliente } from '../../types';

interface ClientesScreenProps {
  navigation: any;
}

export default function ClientesScreen({ navigation }: ClientesScreenProps) {
  const { clientes, guardarCliente, eliminarCliente, buscarClientes, cargarClientes } = useAppData();
  const { esAdministrador } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'nombre' | 'ci'>('nombre');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (busqueda.trim()) {
      realizarBusqueda();
    } else {
      setResultadosBusqueda([]);
    }
  }, [busqueda, tipoBusqueda]);

  const realizarBusqueda = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    try {
      const resultados = await buscarClientes(busqueda, tipoBusqueda);
      setResultadosBusqueda(resultados);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al buscar');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = (cliente: Cliente) => {
    if (!esAdministrador()) {
      Alert.alert('Permiso denegado', 'Solo los administradores pueden eliminar clientes');
      return;
    }
    
    Alert.alert(
      'Eliminar Cliente',
      `¿Está seguro de eliminar a ${cliente.nombre} ${cliente.apellidos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const exito = await eliminarCliente(cliente.id);
            if (exito) {
              Alert.alert('Éxito', 'Cliente eliminado correctamente');
              setResultadosBusqueda([]);
              setBusqueda('');
            } else {
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          },
        },
      ]
    );
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteHeader}>
        <Text style={styles.clienteNombre}>{item.nombre} {item.apellidos}</Text>
        <Text style={styles.clienteCI}>CI: {item.ci}</Text>
      </View>
      {item.direccion && (
        <Text style={styles.clienteInfo}>📍 {item.direccion}</Text>
      )}
      {item.telefono && (
        <Text style={styles.clienteInfo}>📞 {item.telefono}</Text>
      )}
      {item.email && (
        <Text style={styles.clienteInfo}>✉️ {item.email}</Text>
      )}
      <Text style={styles.clienteFecha}>
        Registrado: {new Date(item.fechaRegistro).toLocaleDateString()}
      </Text>
      
      {esAdministrador() && (
        <View style={styles.clienteAcciones}>
          <TouchableOpacity
            style={styles.buttonEditar}
            onPress={() => navigation.navigate('CrearCliente', { cliente: item })}
          >
            <Text style={styles.buttonEditarText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonEliminar}
            onPress={() => handleEliminar(item)}
          >
            <Text style={styles.buttonEliminarText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const listaMostrar = busqueda.trim() ? resultadosBusqueda : clientes;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Clientes</Text>
        
        {esAdministrador() && (
          <TouchableOpacity
            style={styles.buttonNuevo}
            onPress={() => navigation.navigate('CrearCliente')}
          >
            <Text style={styles.buttonNuevoText}>+ Nuevo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.busquedaContainer}>
        <View style={styles.tipoBusqueda}>
          <TouchableOpacity
            style={[styles.tipoButton, tipoBusqueda === 'nombre' && styles.tipoButtonActivo]}
            onPress={() => setTipoBusqueda('nombre')}
          >
            <Text
              style={[
                styles.tipoButtonText,
                tipoBusqueda === 'nombre' && styles.tipoButtonTextActivo,
              ]}
            >
              Nombre
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoButton, tipoBusqueda === 'ci' && styles.tipoButtonActivo]}
            onPress={() => setTipoBusqueda('ci')}
          >
            <Text
              style={[
                styles.tipoButtonText,
                tipoBusqueda === 'ci' && styles.tipoButtonTextActivo,
              ]}
            >
              CI
            </Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.inputBusqueda}
          placeholder={tipoBusqueda === 'nombre' ? 'Buscar por nombre o apellidos...' : 'Buscar por CI...'}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.resultadosInfo}>
            {listaMostrar.length} {listaMostrar.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </Text>
          
          <FlatList
            data={listaMostrar}
            renderItem={renderCliente}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listaContainer}
            ListEmptyComponent={
              <View style={styles.vacio}>
                <Text style={styles.vacioTexto}>
                  {busqueda.trim()
                    ? 'No se encontraron clientes'
                    : 'No hay clientes registrados'}
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonNuevo: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  buttonNuevoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  busquedaContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tipoBusqueda: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipoButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  tipoButtonActivo: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  tipoButtonText: {
    color: '#666',
    fontSize: 13,
  },
  tipoButtonTextActivo: {
    color: '#fff',
    fontWeight: '600',
  },
  inputBusqueda: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  loader: {
    marginTop: 50,
  },
  resultadosInfo: {
    padding: 15,
    fontSize: 14,
    color: '#666',
  },
  listaContainer: {
    padding: 15,
  },
  clienteCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clienteNombre: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  clienteCI: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  clienteInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  clienteFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  clienteAcciones: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  buttonEditar: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonEditarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonEliminar: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonEliminarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  vacio: {
    padding: 40,
    alignItems: 'center',
  },
  vacioTexto: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
