"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFullname = void 0;
async function fetchFullname(phone) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/getFullName/${phone}`);
        const data = await response.json();
        return data.fullname;
    }
    catch (error) {
        console.error(error);
        return '';
    }
}
exports.fetchFullname = fetchFullname;
