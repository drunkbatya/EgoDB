#!/usr/bin/env python3
import requests
import sys
import os


def check_invalid_host_header():
    print("checking invalid host header")
    try:
        requests.get(
            "https://db.drunkbatya.com", headers={"host": "WRONG_HOST"}, timeout=1
        )
        print("Error: function on server/main.js at line 37 isn't working!")
        return 1
    except requests.exceptions.ReadTimeout:
        return 0


def check_cookies():
    print("checking issuing cookies")
    response = requests.post(
        "https://db.drunkbatya.com/server/login",
        data=os.getenv("WEBUI_TESTING_LOGIN", "WEBUI_TESTING_PASS"),
    )
    if "egoSession" in response.cookies:
        return 0
    print("Error: function server/main.js line 45 isn't working!")
    return 1


if __name__ == "__main__":
    exit_code = check_invalid_host_header()
    exit_code = check_cookies()
    sys.exit(exit_code)
