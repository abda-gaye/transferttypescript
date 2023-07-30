export async function fetchFullname(phone: string): Promise<string> {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/getFullName/${phone}`);
        const data = await response.json();
        return data.fullname;
    } catch (error) {
        console.error(error);
        return '';
    }
}
