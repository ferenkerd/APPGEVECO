import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Button, Spinner, Switch } from '@gluestack-ui/themed';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getCurrencies, patchCurrency } from '../services/api';

export default function CurrencySettingsScreen() {
	const navigation = useNavigation();
	const [currencies, setCurrencies] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchCurrencies();
	}, []);

	const fetchCurrencies = async () => {
		setLoading(true);
		try {
			const data = await getCurrencies();
			setCurrencies(Array.isArray(data) ? data : []);
		} catch {
			setCurrencies([]);
		}
		setLoading(false);
	};

	const handleToggleCurrency = async (currency) => {
		setLoading(true);
		try {
			await patchCurrency(currency.id, { is_active: !currency.is_active });
			fetchCurrencies();
		} catch {
			Toast.show({ type: 'error', text1: 'No se pudo actualizar la moneda' });
		}
		setLoading(false);
	};

	return (
		<Box flex={1} bg="#fff" p={16}>
			<Button
				mb={4}
				onPress={() => navigation.navigate('AddCurrency')}
				bg="#007bff"
			>
				<Text color="#fff" fontWeight="bold">Añadir nueva moneda</Text>
			</Button>
			<Text fontWeight="bold" fontSize={18} mb={2}>Monedas registradas</Text>
			<ScrollView style={{ maxHeight: 400 }}>
				{loading ? (
					<Box alignItems="center" justifyContent="center" py={2}>
						<Spinner />
						<Text mt={2}>Cargando monedas...</Text>
					</Box>
				) : null}
				{!loading && currencies && currencies.length === 0 ? (
					<Box alignItems="center" justifyContent="center" py={2}>
						<Text style={{ color: '#888', textAlign: 'center' }}>No hay monedas registradas.</Text>
					</Box>
				) : null}
				{!loading && currencies && currencies.length > 0 ? (
					currencies.map(currency => (
						<TouchableOpacity
							key={currency.id}
							style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}
							onPress={() => navigation.navigate('CurrencyRates', { currency })}
						>
							<HStack alignItems="center" justifyContent="space-between">
								<VStack>
									<Text fontWeight="bold" fontSize={16}>{currency.name} ({currency.code})</Text>
									<Text fontSize={12}>Símbolo: {currency.symbol}</Text>
									<Text fontSize={12}>Estado: {currency.is_active ? 'Activa' : 'Inactiva'}</Text>
								</VStack>
								<Switch
									value={currency.is_active}
									onValueChange={() => handleToggleCurrency(currency)}
									isChecked={currency.is_active}
									accessibilityLabel="Activar/desactivar moneda"
								/>
							</HStack>
						</TouchableOpacity>
					))
				) : null}
			</ScrollView>
		</Box>
	);
}
