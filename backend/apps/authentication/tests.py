from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
        )

    def test_token_obtain_success(self):
        """로그인 시 JWT 토큰이 정상적으로 발급되는지 테스트"""
        url = '/api/auth/token/'
        data = {
            'username': 'testuser',
            'password': 'testpass123',
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIsInstance(response.data['access'], str)
        self.assertIsInstance(response.data['refresh'], str)

    def test_token_obtain_invalid_credentials(self):
        """잘못된 자격증명으로 로그인 시도 시 401 응답 테스트"""
        url = '/api/auth/token/'
        data = {
            'username': 'testuser',
            'password': 'wrongpassword',
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_success(self):
        """Refresh 토큰으로 Access 토큰 갱신 테스트"""
        url = '/api/auth/token/'
        data = {
            'username': 'testuser',
            'password': 'testpass123',
        }
        response = self.client.post(url, data, format='json')
        refresh_token = response.data['refresh']

        refresh_url = '/api/auth/token/refresh/'
        refresh_data = {'refresh': refresh_token}
        refresh_response = self.client.post(
            refresh_url, refresh_data, format='json'
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_token_refresh_invalid_token(self):
        """잘못된 Refresh 토큰으로 갱신 시도 시 401 응답 테스트"""
        refresh_url = '/api/auth/token/refresh/'
        refresh_data = {'refresh': 'invalid_token'}
        response = self.client.post(refresh_url, refresh_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_without_token(self):
        """토큰 없이 인증이 필요한 엔드포인트 접근 시 401 응답 테스트"""
        url = '/api/dashboard/overview/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_with_valid_token(self):
        """유효한 토큰으로 인증이 필요한 엔드포인트 접근 테스트"""
        url = '/api/auth/token/'
        data = {
            'username': 'testuser',
            'password': 'testpass123',
        }
        response = self.client.post(url, data, format='json')
        access_token = response.data['access']

        protected_url = '/api/dashboard/overview/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        protected_response = self.client.get(protected_url)

        self.assertNotEqual(
            protected_response.status_code, status.HTTP_401_UNAUTHORIZED
        )
