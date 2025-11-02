.PHONY: test test-coverage migrate install

install:
	pip install -r requirements.txt

migrate:
	python manage.py migrate

test:
	python manage.py test

test-pytest:
	pytest

test-coverage:
	pytest --cov=. --cov-report=html --cov-report=term

runserver:
	python manage.py runserver

createsuperuser:
	python manage.py createsuperuser


