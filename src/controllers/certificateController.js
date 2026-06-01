const pool = require("../config/db");

exports.getCertificates = async (req,res)=>{

try{

const userId=req.user.id;

const result=await pool.query(

`
SELECT

c.id as course_id,
c.title as course_title,
u.name as student_name,

ROUND(
AVG(
COALESCE(
s.score,0
)
)
) as final_score

FROM courses c

JOIN enrollments e
ON c.id=e.course_id

JOIN users u
ON u.id=e.user_id

LEFT JOIN assignments a
ON a.course_id=c.id

LEFT JOIN submissions s
ON s.assignment_id=a.id
AND s.student_id=u.id

WHERE e.user_id=$1

GROUP BY
c.id,
c.title,
u.name
`,
[userId]

);

const certificates=
result.rows.map(course=>({

...course,

certificate_id:
"CERT-"+Date.now()+"-"+Math.floor(
Math.random()*1000
),

completion_date:
new Date()

}));

res.json(certificates);

}catch(err){

res.status(500).json({
error:err.message
});

}

};