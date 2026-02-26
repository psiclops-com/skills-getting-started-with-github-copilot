def test_unregister_success(client):
    # Arrange
    activity = "Chess Club"
    email = "michael@mergington.edu"
    url = f"/activities/{activity}/unregister?email={email}"

    # Act
    response = client.post(url)

    # Assert
    assert response.status_code == 200
    assert response.json()["message"] == f"Removed {email} from {activity}"
    assert email not in client.get("/activities").json()[activity]["participants"]


def test_unregister_not_found(client):
    # Arrange
    activity = "Chess Club"
    email = "notfound@mergington.edu"
    url = f"/activities/{activity}/unregister?email={email}"

    # Act
    response = client.post(url)

    # Assert
    assert response.status_code == 404
    assert "Participant not found" in response.json()["detail"]
