import Users from './users.js';
import Rooms from './rooms.js';

export default class Storage {
    static initInstance() {
        Storage.instance = new Storage();
    }

    static getInstance() {
        if (!Storage.instance) {
            Storage.initInstance();
        }

        return Storage.instance;
    }

    constructor() {
        this.sessions = new Map()
        this.users = new Users()
        this.rooms = new Rooms()
        this.clients = []
        this.nextRoomId = 1;
        this.nextUserId = 1;
    }

    getNextUserID() {
        return this.nextUserId++;
    }

    getNextRoomID() {
        return this.nextRoomId++;
    }
}