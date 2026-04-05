const express = require('express');
const {
  getResources,
  getResourceById,
  getStorageLocations,
  getStorageLocationById
} = require('../controllers/service-catalog.controller');

const router = express.Router();

/**
 * @swagger
 * /api/services/resources:
 *   get:
 *     summary: Get all active learning resources
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Resources fetched
 */
router.get('/resources', getResources);
/**
 * @swagger
 * /api/services/resources/{id}:
 *   get:
 *     summary: Get a learning resource by id
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resource fetched
 */
router.get('/resources/:id', getResourceById);
/**
 * @swagger
 * /api/services/storage-locations:
 *   get:
 *     summary: Get active storage locations
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Storage locations fetched
 */
router.get('/storage-locations', getStorageLocations);
/**
 * @swagger
 * /api/services/storage-locations/{id}:
 *   get:
 *     summary: Get a storage location by id
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Storage location fetched
 */
router.get('/storage-locations/:id', getStorageLocationById);

module.exports = router;
