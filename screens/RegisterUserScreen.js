import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Box, Button, Input, InputField, Text, Select, SelectItem, Spinner, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator } from '@gluestack-ui/themed';
import { getPrefixes } from '../services/api';
import { registerUser } from '../services/registerUser';

const JOB_POSITIONS = [
	{ id: 1, name: 'Superadmin' },
	{ id: 2, name: 'Admin' },
	{ id: 3, name: 'Almacenista' },
	{ id: 4, name: 'Cajero' },
];

const GENDERS = [
	{ label: 'Masculino', value: 'M' },
	{ label: 'Femenino', value: 'F' },
];

export default function RegisterUserScreen() {
	const [form, setForm] = useState({
		username: '',
		email: '',
		password: '',
		password2: '',
		job_position_id: '',
		profile_data: {
			identity_card: '',
			last_name: '',
			gender: '',
			prefix_data: { code: '' },
			contact_phone: '',
			address: '',
		},
	});
	const [prefixes, setPrefixes] = useState([]);
	const [loadingPrefixes, setLoadingPrefixes] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		(async () => {
			setLoadingPrefixes(true);
			try {
				const data = await getPrefixes();
				setPrefixes(Array.isArray(data) ? data : (data.results || []));
			} catch {
				setPrefixes([]);
			}
			setLoadingPrefixes(false);
		})();
	}, []);

	const handleChange = (field, value) => {
		setForm(prev => ({ ...prev, [field]: value }));
	};
	const handleProfileChange = (field, value) => {
		setForm(prev => ({
			...prev,
			profile_data: { ...prev.profile_data, [field]: value },
		}));
	};
	const handlePrefixChange = value => {
		setForm(prev => ({
			...prev,
			profile_data: {
				...prev.profile_data,
				prefix_data: { code: value },
			},
		}));
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		setError('');
		setSuccess('');
		try {
			const payload = {
				...form,
				job_position_id: Number(form.job_position_id),
				profile_data: {
					...form.profile_data,
					gender: form.profile_data.gender,
					prefix_data: { code: form.profile_data.prefix_data.code },
				},
			};
			console.log('Payload registro usuario:', payload);
			const res = await registerUser(payload);
			console.log('Respuesta backend registro:', res);
			setSuccess('Usuario registrado correctamente');
			setForm({
				username: '', email: '', password: '', password2: '', job_position_id: '',
				profile_data: { identity_card: '', last_name: '', gender: '', prefix_data: { code: '' }, contact_phone: '', address: '' },
			});
		} catch (e) {
			console.log('Error en fetch registro:', e);
			setError('No se pudo registrar el usuario');
		}
		setSubmitting(false);
	};

	return (
		<Box flex={1}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<Box mb={3}><Text size="lg" bold>Registro de Usuario</Text></Box>
				<Box mb={2}>
					<Text mb={1}>Usuario</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.username} placeholder="Usuario" onChangeText={v => handleChange('username', v)} />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Email</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.email} placeholder="Email" onChangeText={v => handleChange('email', v)} keyboardType="email-address" />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Contraseña</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.password} placeholder="Contraseña" onChangeText={v => handleChange('password', v)} secureTextEntry />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Repetir contraseña</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.password2} placeholder="Repetir contraseña" onChangeText={v => handleChange('password2', v)} secureTextEntry />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Cédula</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.profile_data.identity_card} placeholder="Cédula" onChangeText={v => handleProfileChange('identity_card', v)} />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Apellido</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.profile_data.last_name} placeholder="Apellido" onChangeText={v => handleProfileChange('last_name', v)} />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Género</Text>
					<Select
						selectedValue={form.profile_data.gender}
						onValueChange={v => handleProfileChange('gender', v)}
						accessibilityLabel="Selecciona género"
					>
						<SelectTrigger>
							<SelectInput placeholder="Selecciona género" value={form.profile_data.gender ? (form.profile_data.gender === 'M' ? 'Masculino' : 'Femenino') : ''} />
							<SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
						</SelectTrigger>
						<SelectPortal>
							<SelectBackdrop />
							<SelectContent>
								<SelectDragIndicatorWrapper>
									<SelectDragIndicator />
								</SelectDragIndicatorWrapper>
								<SelectItem label="Masculino" value="M" />
								<SelectItem label="Femenino" value="F" />
							</SelectContent>
						</SelectPortal>
					</Select>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Prefijo</Text>
					{loadingPrefixes ? <Spinner /> : (
						<Select
							selectedValue={form.profile_data.prefix_data.code}
							onValueChange={handlePrefixChange}
							accessibilityLabel="Selecciona prefijo"
						>
							<SelectTrigger>
								<SelectInput placeholder="Selecciona prefijo" value={form.profile_data.prefix_data.code} />
								<SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
							</SelectTrigger>
							<SelectPortal>
								<SelectBackdrop />
								<SelectContent>
									<SelectDragIndicatorWrapper>
										<SelectDragIndicator />
									</SelectDragIndicatorWrapper>
									{prefixes.map(opt => (
										<SelectItem key={opt.code} label={opt.code} value={opt.code} />
									))}
								</SelectContent>
							</SelectPortal>
						</Select>
					)}
				</Box>
				<Box mb={2}>
					<Text mb={1}>Teléfono</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.profile_data.contact_phone} placeholder="Teléfono" onChangeText={v => handleProfileChange('contact_phone', v)} keyboardType="phone-pad" />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Dirección</Text>
					<Input variant="outline" mb={2}>
						<InputField value={form.profile_data.address} placeholder="Dirección" onChangeText={v => handleProfileChange('address', v)} />
					</Input>
				</Box>
				<Box mb={2}>
					<Text mb={1}>Cargo</Text>
					<Select
						selectedValue={form.job_position_id}
						onValueChange={v => handleChange('job_position_id', v)}
						accessibilityLabel="Selecciona cargo"
					>
						<SelectTrigger>
							<SelectInput placeholder="Selecciona cargo" value={(() => {
								const found = JOB_POSITIONS.find(opt => String(opt.id) === String(form.job_position_id));
								return found ? found.name : '';
							})()} />
							<SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
						</SelectTrigger>
						<SelectPortal>
							<SelectBackdrop />
							<SelectContent>
								<SelectDragIndicatorWrapper>
									<SelectDragIndicator />
								</SelectDragIndicatorWrapper>
								{JOB_POSITIONS.map(opt => (
									<SelectItem key={opt.id} label={opt.name} value={String(opt.id)} />
								))}
							</SelectContent>
						</SelectPortal>
					</Select>
				</Box>
				{error ? <Text color="red.600" mb={2}>{error}</Text> : null}
				{success ? <Text color="green.600" mb={2}>{success}</Text> : null}
				<Button onPress={handleSubmit} isDisabled={submitting}>
					<Text>{submitting ? 'Registrando...' : 'Registrar'}</Text>
				</Button>
			</ScrollView>
		{/* Footer fijo */}
		<Box height={48} />
		</Box>
	);
}
