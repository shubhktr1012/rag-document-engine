from app import app
import json

def test_ask_endpoint_success():
    client = app.test_client()
    response = client.post(
        "/ask",
        data=json.dumps({"question": "What is the name of the person in the CV?"}),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.get_json()
    answer = data.get("answer")

def test_ask_no_query():
    client = app.test_client()
    response = client.post(
        "/ask",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert response.status_code == 400