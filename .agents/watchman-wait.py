#!/usr/bin/env python3
import sys
import os
import json
import socket
import subprocess

def get_sockname():
    try:
        out = subprocess.check_output(['watchman', 'get-sockname'])
        data = json.loads(out)
        return data['sockname']
    except Exception as e:
        sys.stderr.write(f"Error getting watchman socket: {e}\n")
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: watchman-wait <path>\n")
        sys.exit(1)
        
    root_path = os.path.abspath(sys.argv[-1])
    
    sock_path = get_sockname()
    
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        sock.connect(sock_path)
    except Exception as e:
        sys.stderr.write(f"Failed to connect to watchman socket {sock_path}: {e}\n")
        sys.exit(1)
        
    sock_file = sock.makefile('r', encoding='utf-8')
    
    # Watch project
    sock.sendall(json.dumps(["watch-project", root_path]).encode('utf-8') + b'\n')
    response = json.loads(sock_file.readline())
    if "error" in response:
        sys.stderr.write(f"Watch project error: {response['error']}\n")
        sys.exit(1)
        
    # Subscribe to changes
    sub_cmd = ["subscribe", root_path, "watchman-wait-emul", {
        "fields": ["name"],
    }]
    sock.sendall(json.dumps(sub_cmd).encode('utf-8') + b'\n')
    
    response = json.loads(sock_file.readline())
    if "error" in response:
        sys.stderr.write(f"Subscription error: {response['error']}\n")
        sys.exit(1)
        
    # Stream files
    while True:
        line = sock_file.readline()
        if not line:
            break
        data = json.loads(line)
        if "files" in data:
            for file_path in data["files"]:
                print(file_path)
                sys.stdout.flush()

if __name__ == '__main__':
    main()
