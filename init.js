const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Snapshot = require("./models/schema.js"); // Assuming you have a 'snapshot.js' model

app.set("view engine", "ejs");

main().then(async () => {
    console.log("Connection successful");

    // Clear the Snapshot collection using async/await
    try {
        await Snapshot.deleteMany(); // Clear existing documents
        console.log("Snapshot collection cleared, inserting sample data...");

        // Insert initial data for testing
        let snapshotData = [
            { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWnbW6W6xl9pt9qophUC1j02vEZmh_PO56Wg&s", date: new Date() },
            { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9MtOQPyrX_edPyD8snh0hBc9tXLT9GXcTcg&s", date: new Date() },
            { url: "https://res.cloudinary.com/daasu69h3/image/upload/v12345678/snapshot_3.jpg", date: new Date() },
            { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcoLM17-fA4tL-xiDnkIDyPuRDx07DtZeuSmEgefx6y9GEsZGT2ul_l-xUmkWESLNKtOw&usqp=CAU", date: new Date() },
            { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkybm1nzOIx4j6K4P6xsNOOd9kswm1GyqSWpFHaWyk-dFUrEXLuCH_tlcoFjHDS5DAIZo&usqp=CAU", date: new Date() },
            { url: "https://img.freepik.com/premium-photo/people-colorful-thermal-scan-with-celsius-degree-temperature_23-2149170140.jpg", date: new Date() }
        ];

        // Insert the sample snapshot data into the database
        await Snapshot.insertMany(snapshotData); // Use await to handle the insertion
        console.log("Snapshot data inserted successfully");
    } catch (err) {
        console.log("Error:", err);
    }

}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/snapshotDB'); // Update with your MongoDB database
}
