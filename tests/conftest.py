import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

@pytest.fixture
def client():
    original_activities = activities.copy()
    with TestClient(app) as test_client:
        yield test_client
    activities.clear()
    activities.update(original_activities)
