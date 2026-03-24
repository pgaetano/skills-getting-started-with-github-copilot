from src import app as _app_module


def test_get_activities(client):
    # Arrange: client fixture provided, known starting state restored by autouse fixture
    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert isinstance(data["Chess Club"]["participants"], list)


def test_signup_and_prevent_duplicate(client):
    # Arrange
    email = "tester@example.com"
    activity = "Soccer Team"

    # Act: sign up
    resp_signup = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert signup succeeded and participant added
    assert resp_signup.status_code == 200
    assert email in _app_module.activities[activity]["participants"]

    # Act: try duplicate signup
    resp_duplicate = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert duplicate rejected
    assert resp_duplicate.status_code == 400


def test_unregister_participant_and_not_found(client):
    # Arrange
    email = "unregister@example.com"
    activity = "Basketball Club"
    # ensure participant is present
    _app_module.activities[activity]["participants"].append(email)

    # Act: unregister
    resp_unreg = client.post(f"/activities/{activity}/unregister", params={"email": email})

    # Assert removed
    assert resp_unreg.status_code == 200
    assert email not in _app_module.activities[activity]["participants"]

    # Act: unregister same email again
    resp_notfound = client.post(f"/activities/{activity}/unregister", params={"email": email})

    # Assert not found
    assert resp_notfound.status_code == 404
