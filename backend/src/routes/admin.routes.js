const express = require('express');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');
const {
  createSponsoredBrand,
  getSponsoredBrands,
  updateSponsoredBrand,
  createSponsoredProduct,
  getSponsoredProducts,
  updateSponsoredProduct,
  updateSponsoredProductStatus,
  createEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  getEmailLogs,
  createCourseResource,
  createStorageLocation
} = require('../controllers/admin-content.controller');

const router = express.Router();

router.use(protectAdmin);

/**
 * @swagger
 * /api/admin/sponsored-brands:
 *   post:
 *     summary: Create a sponsored brand
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Sponsored brand created
 *   get:
 *     summary: List sponsored brands
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsored brands fetched
 */
router.post('/sponsored-brands', createSponsoredBrand);
router.get('/sponsored-brands', getSponsoredBrands);
/**
 * @swagger
 * /api/admin/sponsored-brands/{id}:
 *   put:
 *     summary: Update a sponsored brand
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sponsored brand updated
 */
router.put('/sponsored-brands/:id', updateSponsoredBrand);

/**
 * @swagger
 * /api/admin/sponsored-products:
 *   post:
 *     summary: Create a sponsored product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Sponsored product created
 *   get:
 *     summary: List sponsored products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsored products fetched
 */
router.post('/sponsored-products', createSponsoredProduct);
router.get('/sponsored-products', getSponsoredProducts);
/**
 * @swagger
 * /api/admin/sponsored-products/{id}:
 *   put:
 *     summary: Update a sponsored product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sponsored product updated
 */
router.put('/sponsored-products/:id', updateSponsoredProduct);
/**
 * @swagger
 * /api/admin/sponsored-products/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a sponsored product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sponsored product status updated
 */
router.patch('/sponsored-products/:id/status', updateSponsoredProductStatus);

/**
 * @swagger
 * /api/admin/email-templates:
 *   post:
 *     summary: Create an email template
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Email template created
 *   get:
 *     summary: List email templates
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email templates fetched
 */
router.post('/email-templates', createEmailTemplate);
router.get('/email-templates', getEmailTemplates);
/**
 * @swagger
 * /api/admin/email-templates/{id}:
 *   put:
 *     summary: Update an email template
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email template updated
 */
router.put('/email-templates/:id', updateEmailTemplate);
/**
 * @swagger
 * /api/admin/email-logs:
 *   get:
 *     summary: View email log history
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email logs fetched
 */
router.get('/email-logs', getEmailLogs);

router.post('/resources', createCourseResource);
router.post('/storage-locations', createStorageLocation);

module.exports = router;
