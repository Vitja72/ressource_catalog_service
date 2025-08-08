import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { validateResource } from '../middleware/validation.js';


const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data_file = path.join(__dirname, '../data', 'resources.json');
const FEEDBACK_FILE = path.join(__dirname, '../data', 'feedback.json');


router.get('/', (req, res, next) => {
    try {
        const data = readFileSync(data_file, 'utf8');
        let resources = JSON.parse(data);
        const { type, authorId } = req.query;

        if (type) {
            resources = resources.filter(r => r.type === type);

        if (authorId) {
            resources = resources.filter(r => r.authorId === authorId);
        }; 
        
        }

                            
        
    } catch (error) {
        next(error);
    }
});


router.get('/:id', (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const data = readFileSync(data_file, 'utf8');
        const resources = JSON.parse(data);
        const resource = resources.find(r => r.id === resourceId);

        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({ error: `Ressource mit ID ${resourceId} nicht gefunden.` })
        }

    } catch (error) {
    next(error); 
    }
});


router.post('/', validateResource, (req, res, next) => {
    const newResourceData = req.body;



    // 1. Neues Resource Objekt

    const newResource = {
        id: uuidv4(),
        ...newResourceData
    };

    try {
        // 2. Vorhandene Daten aus der Datei lesen und in einem Array speichern.
        const data = readFileSync(data_file, 'utf8');
        const resources = JSON.parse(data);
        // 3. Das neue Objekt in das Array hinzufuegen.
        resources.push(newResource);
        // 4. Das neue Array in die Datei schreiben.
        writeFileSync(data_file, JSON.stringify(resources, null, 2), 'utf8');
        // 5. Antwort schicken.
        res.status(201).json(newResource);
    } catch (error) {
        next(error); 
    }

});

router.post('/:resourcesId/feedback', (req, res, next) => {
    const resourcesId = req.params.resourcesId;
    const { feedbackText, userId } = req.body;

    if (!feedbackText || feedbackText.trim().length < 10 || feedbackText.trim().length > 500) {
        return res.status(400).json({ error: 'Feedback-Text muss zwischen 10 und 500 Zeichen lang sein. '});
    }
    const newFeedback = {
        id: uuidv4(), 
        resourceId: resourcesId,
        feedbackText: feedbackText.trim(),
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
    };

    try {
        const data = readFileSync(FEEDBACK_FILE, 'utf-8');
        const feedback = JSON.parse(data);
        feedback.push(newFeedback);
        const newFeedbackData = JSON.stringify(feedback, null, 2);
        writeFileSync(FEEDBACK_FILE, newFeedbackData, 'utf-8');
        res.status(201).json(newFeedback);
    } catch (error) {
        console.error('Fehler beim Schreiben des Feedbacks in die Datei:', error);
        next(error);

    }

});

router.put('/:resourcesId/feedback/:feedbackId', (req, res, next) => {
    const resourceId = req.params.resourcesId;
    const feedbackId = req.params.feedbackId;
    const { feedbackText } = req.body;

    if (!feedbackText || feedbackText.trim().length < 10 || feedbackText.trim > 500) {
        return res.status(400).json({ error: 'Aktuallisierter Feedback-Text muss zwischen 10 un 500 Zeichen lang sei. '})
    };
    try {
        const data = readFileSync(FEEDBACK_FILE, 'utf-8');
        let feedback = JSON.parse(data);
        const feedbackIndex = feedback.findIndex(f => f.id === feedbackId && f.resourceId ===resourceId);

        if (feedbackIndex === -1) {
            return res.status(404).json({ error: `Feedback mit ID ${feedbackId} für Ressource ${resourceId} nicht gefunden.`})
        };
        feedback[feedbackIndex] = {
            ...feedback[feedbackIndex],
            feedbackText: feedbackText.trim(),
            timestamp: new Date().toISOString()
        
        };
        const newFeedbackData = JSON.stringify(feedback, null, 2);
        writeFileSync(FEEDBACK_FILE, newFeedbackData, 'utf-8');
        res.status(200).json(feedback[feedbackIndex]);

    } catch (error) {
        console.error('Fehler beim Aktuallisieren des Feedbacks:', error);
        next(error);

    };
});


router.put('/:id', (req, res, next) => {
    // 1. ID auslesen
    const resourceId = req.params.id;
    const newData = req.body; 
    
    if (!newData || Object.keys(newData).length === 0) {
        res.status(400).json({ error: 'Keine Daten zum Aktualisieren vorhanden.' });
        return;
    }

    try {
        // 2. Alle Ressourcen laden
        const data = readFileSync(data_file, 'utf8');
        const resources = JSON.parse(data);

        // 3. Die Ressource nach der ID suchen
        // const resource = resources.find(r => r.id === resourceId);
        const resourceIndex = resources.findIndex(r => r.id === resourceId);

        // 4. Wenn die Ressource nicht existiert - dann 404
        if (resourceIndex === -1) {
            res.status(404).json({ error: `Ressource mit ID ${resourceId} nicht gefunden.`});
            return;
        }

        // 5. Wenn die Ressource existiert - updaten
        resources[resourceIndex] = {...resources[resourceIndex], ...newData};

        // 6. Updates in der Datei speichern.
        writeFileSync(data_file, JSON.stringify(resources, null, 2), 'utf8');

        res.status(200).json(resources[resourceIndex]);

    } catch(error) {
        next(error); 
    }
}); 

    router.delete('/:id', (req, res, next) => {
        const resourceId = req.params.id;
           
        try {
        
        const data = readFileSync(data_file, 'utf8');
        const resources = JSON.parse(data);
       
        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        
        if (resourceIndex === -1) {
            res.status(404).json({ error: `Ressource mit ID ${resourceId} nicht gefunden.`});
            return;
        }
                     
        resources.splice(resourceIndex, 1);
        writeFileSync(data_file, JSON.stringify(resources, null, 2), 'utf8');

        res.status(204).json({error: 'No Content'});

    } catch(error) {
        next(error); 

    };
    });

    router.delete('/:resourceId/feedback/:feedbackId', (req, res, next) => {
        const resourceId = req.params.resourceId;
        const feedbackId = req.params.feedbackId;

        try {
        const data = readFileSync(FEEDBACK_FILE, 'utf-8');
        let feedback = JSON.parse(data);
        const initialLength = feedback.length;
        feedback = feedback.filter(f => !(f.id === feedbackId && f.resourceId === resourceId));
        
         if (feedback.length === initialLength) {
            return res.status(404).json({ error: `Feedback mit ID ${feedbackId} für Ressource ${resourceId} nicht gefunden.` });
        }

        const newFeedbackData = JSON.stringify(feedback, null, 2);
        writeFileSync(FEEDBACK_FILE, newFeedbackData, 'utf-8');
        res.status(204).end();

    
} catch (error) {
    console.error('Fehler bein Löschen des Feedbacks:', error);
    next(error);

};
});


export default router;