module.exports.testController = function (req, res) {
    const receivedData = req.body;
    console.log("Received this:", receivedData);
    res.status(200).json({ success: true, message: "Client data received.", receivedData })
}