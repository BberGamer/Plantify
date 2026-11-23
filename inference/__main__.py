import uvicorn


if __name__ == "__main__":
    # Một worker sở hữu một model; backend Express gọi qua loopback.
    uvicorn.run("inference.app:app", host="127.0.0.1", port=8001, workers=1)
