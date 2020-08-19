// C# connection
const { ConnectionBuilder } = require("electron-cgi");

module.exports = () => {
    const connection = new ConnectionBuilder()
    .connectTo("C:\\Program Files\\dotnet\\dotnet", "run", "--project", ".\\dotnet\\app")
    .build()
    connection.onDisconnect = () => { console.log("Connection Disconnected") }
        connection.send('greetings', 'Mom', (error, response) => {
        if (error) {
            console.log(error) //serialized exception from the .NET handler
            return;
        }
        console.log(response)
        connection.close()
    });
}