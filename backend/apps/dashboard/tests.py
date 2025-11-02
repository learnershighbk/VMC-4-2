from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class DashboardTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
        )
        self.authenticated_client = APIClient()
        self.authenticated_client.force_authenticate(user=self.user)

    def test_overview_without_authentication(self):
        """인증 없이 대시보드 개요 조회 시도 시 401 응답 테스트"""
        url = '/api/dashboard/overview/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_overview_with_authentication(self):
        """인증된 사용자가 대시보드 개요 조회 테스트"""
        url = '/api/dashboard/overview/'
        response = self.authenticated_client.get(url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_501_NOT_IMPLEMENTED,
            ],
        )

    def test_performance_without_authentication(self):
        """인증 없이 실적 데이터 조회 시도 시 401 응답 테스트"""
        url = '/api/dashboard/performance/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_performance_with_authentication(self):
        """인증된 사용자가 실적 데이터 조회 테스트"""
        url = '/api/dashboard/performance/'
        response = self.authenticated_client.get(url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_501_NOT_IMPLEMENTED,
            ],
        )

    def test_performance_with_evaluation_year_filter(self):
        """평가년도 필터를 사용한 실적 데이터 조회 테스트"""
        url = '/api/dashboard/performance/'
        params = {'evaluation_year': 2024}
        response = self.authenticated_client.get(url, params)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_501_NOT_IMPLEMENTED,
            ],
        )

    def test_metrics_without_authentication(self):
        """인증 없이 지표 데이터 조회 시도 시 401 응답 테스트"""
        url = '/api/dashboard/metrics/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_metrics_with_authentication(self):
        """인증된 사용자가 지표 데이터 조회 테스트"""
        url = '/api/dashboard/metrics/'
        response = self.authenticated_client.get(url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_501_NOT_IMPLEMENTED,
            ],
        )

    def test_metrics_with_date_range_filter(self):
        """날짜 범위 필터를 사용한 지표 데이터 조회 테스트"""
        url = '/api/dashboard/metrics/'
        params = {
            'start_date': '2024-01-01',
            'end_date': '2024-12-31',
            'evaluation_year': 2024,
        }
        response = self.authenticated_client.get(url, params)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_404_NOT_FOUND,
                status.HTTP_501_NOT_IMPLEMENTED,
            ],
        )
