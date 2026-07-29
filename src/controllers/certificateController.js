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

                u.email,

                COUNT(DISTINCT q.id) AS total_quizzes,

                COUNT(DISTINCT qa.quiz_id) AS passed_quizzes

            FROM enrollments e

            JOIN users u
            ON u.id = e.user_id

            LEFT JOIN quizzes q
            ON q.course_id = e.course_id

            LEFT JOIN quiz_attempts qa
            ON qa.quiz_id = q.id
            AND qa.student_id = u.id
            AND qa.submitted = TRUE

            WHERE e.course_id = $1

            GROUP BY

                u.id,
                u.name,
                u.email

            ORDER BY u.name
            `,

            [courseId]

        );

        const students = result.rows.map(student => ({

            ...student,

            quizzes_completed:
                Number(student.total_quizzes) ===
                Number(student.passed_quizzes)

        }));

        res.json(students);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};