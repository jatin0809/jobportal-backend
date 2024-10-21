const express = require("express");
const router = express.Router();
const {Job } = require("../schema/job.schema");
const authMiddleware = require("../middlewares/auth");
const isAuth = require("../utils/index");
const {z} = require("zod");
const {validateRequest} = require("zod-express-middleware");

router.post("/", authMiddleware, async (req, res)=>{
    try {
        const {name, logo, position, salary, jobType, remote, location, description, about, skills, information } = req.body;  
        const { user } = req;
        const jobs = skills.split(",").map(skill => skill.trim());
        const job = new Job({name, logo, position, salary, jobType, remote, location, description, about, skills: jobs, information, creator: user});
        await job.save();
        res.status(201).json({message: "Job Created Successfully"});
    } catch (error) {
        res.status(400).json({message: "Job not Created"});
    }  
})

router.get("/", async (req, res)=>{
    const isAuthenticated = isAuth(req);
    const jobs = isAuthenticated ? await Job.find() : await Job.find().select("-_id -creator -about -information");
    // const canEdit = isAuthenticated ? req.user.toString() === job.creator.toString()  : false;
    res.status(200).json(jobs);
})

router.get("/:id", validateRequest({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    })
}), authMiddleware, async (req, res)=>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){
        return res.status(404).json({message: "Job not found"});
    }
    res.status(200).json(job);
})

router.delete("/:id", authMiddleware, async (req, res)=>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){
        return res.status(404).json({message: "Job not found"});
    }
    if(job.creator.toString() !== req.user.toString()){
        return res.status(401).json({message: "You are not authorized to delete this job"});
    }
    await Job.findByIdAndDelete(id);
    res.status(200).json({message: "Job deleted successfully"});
})

router.put("/:id", authMiddleware, async (req, res)=>{
    try {
        const {id} = req.params;
        const {name, logo, position, salary, jobType, remote, location, description, about, skills, information } = req.body;
        const jobskills = skills?.split(",").map(skill => skill.trim());
        let job = await Job.findById(id);
        if(!job){
            return res.status(404).json({message: "Job not found"});
        }
        if(job.creator.toString() !== req.user.toString()){
            return res.status(401).json({message: "you are not authorized to update this job"})
        }
        job = await Job.findByIdAndUpdate(id, {name, logo, position, salary, jobType, remote, location, description, about, skills: jobskills, information }, {new: true} );
        res.status(200).json(job);
    } catch (error) {
        res.status(400).json({message: "Job not updated"});
    }
})

// search by titile
router.get("/search/:title", async (req, res)=>{
    const {title} = req.params;
    const jobs = await Job.find({position: new RegExp(title, "i") }).select("-_id -creator -__v -about -information");
    res.status(200).json(jobs);
})
module.exports = router;