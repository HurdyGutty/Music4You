const clients = [];

export function addClient(res) { 
    const client = {
        id: Date.now() + Math.random(),
        res,
    };
    clients.push(client);
    return client;
}

export function removeClient(clientId) {
    const index = clients.findIndex(client => client.id === clientId);
    if (index !== -1) clients.splice(index, 1);
}


export function sendInitialEvent(res, event) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function sendEventToAllClients(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`
    clients.slice().forEach(client => {
        try {
            client.res.write(payload);
        } catch (error) {
            removeClient(client.id);
        }
    })
}