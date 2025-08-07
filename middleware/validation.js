const validateResource = (req, res, next) => {
    const { title, type } = req.body;

    if (!title || !type) {
        return res.status(400).json({error: 'Titel und Typ der Resource sind erforderlich.'});
    };
    next();
};

export { validateResource };