import React from 'react';

import AuthFormWrapper from '../components/AuthFormWrapper';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
	return (
		<AuthFormWrapper>
			<RegisterForm />
		</AuthFormWrapper>
	);
}
