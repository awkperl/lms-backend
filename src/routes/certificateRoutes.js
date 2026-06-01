const express=require("express");

const router=express.Router();

const auth=require("../middleware/auth");

const certificateController=
require("../controllers/certificateController");

router.get(
"/",
auth,
certificateController.getCertificates
);

module.exports=router;