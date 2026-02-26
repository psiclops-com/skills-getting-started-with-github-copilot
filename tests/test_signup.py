def test_signup_success(client):
    # Arrange
    activity = "Chess Club"
    email = "newstudent@mergington.edu"
    url = f"/activities/{activity}/signup?email={email}"

    # Act
    response = client.post(url)

    # Assert
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity}"
    assert email in client.get("/activities").json()[activity]["participants"]


def test_signup_duplicate(client):
    # Arrange
    activity = "Chess Club"
    email = "michael@mergington.edu"  # Already signed up
    url = f"/activities/{activity}/signup?email={email}"

    # Act
    response = client.post(url)

    # Assert
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]
