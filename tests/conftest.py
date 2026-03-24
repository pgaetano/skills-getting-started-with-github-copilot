import copy

import pytest
from fastapi.testclient import TestClient

from src.app import app, activities


@pytest.fixture
def client():
    """Provide a TestClient for the FastAPI app."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_activities():
    """Snapshot and restore the module-level `activities` dict around each test.

    This prevents tests from leaking state into each other. The fixture is
    autouse so it runs for every test automatically.
    """
    original = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(original)
