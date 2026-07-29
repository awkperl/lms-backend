const pool = require("../config/db");
exports.generateCertificate = async (req, res) => {

    try {

        const { courseId, studentId } = req.body;

        const certificateNumber =
            "CERT-" + Date.now();

        const result = await pool.query(

            `
            INSERT INTO certificates
            (
                student_id,
                course_id,
                certificate_number
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,

            [
                studentId,
                courseId,
                certificateNumber
            ]

        );

        res.json({

            message: "Certificate generated successfully.",

            certificate: result.rows[0]

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};
exports.getCourseStudents = async (req, res) => {

    try {

        const { courseId } = req.params;

        const result = await pool.query(

            `
            SELECT

                u.id AS student_id,

                u.name AS student_name,

                u.email

            FROM enrollments e

            JOIN users u
            ON u.id = e.user_id

            WHERE e.course_id = $1

            ORDER BY u.name
            `,

            [courseId]

        );

        res.json(result.rows);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};