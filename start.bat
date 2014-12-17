start cmd /k ""C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe" --dbpath "C:\wamp\www\netCanvas\data\mongo""
start cmd /k "node "c:\wamp\www\netCanvas\mongo-rest\express.js""
start chrome --kiosk "http://localhost/netCanvas" --use-fake-ui-for-media-stream