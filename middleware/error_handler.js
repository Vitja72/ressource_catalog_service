const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error:'Ein interner Fehler ist aufgetreten.'});

};

export { errorHandler };