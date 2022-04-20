module.exports = (error, req, res, next) => {
    console.log('Error Handling Middleware called for path: ', req.path);
    console.log(error);
    res.status(500).send({ description: error.message ? error.message : 'Unknown error'});
}
