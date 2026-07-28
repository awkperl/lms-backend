const pool = require("../config/db");


// GET QUIZ ANALYTICS OVERVIEW
exports.getAnalyticsOverview = async (req, res) => {

    try {

        // Total submitted attempts
        const attemptsResult = await pool.query(
            `
            SELECT COUNT(*) AS total_attempts

            FROM quiz_attempts

            WHERE submitted = true
            `
        );


        const totalAttempts = Number(
            attemptsResult.rows[0].total_attempts
        );


        // Average percentage across all submitted attempts
        const averageResult = await pool.query(
            `
            SELECT

                AVG(
                    CASE

                        WHEN total_points = 0
                        THEN 0

                        ELSE (score * 100 / total_points)

                    END
                ) AS average_score


            FROM (

                SELECT

                    qa.score,

                    COALESCE(
                        SUM(q.points),
                        0
                    ) AS total_points


                FROM quiz_attempts qa


                JOIN questions q

                ON q.quiz_id = qa.quiz_id


                WHERE qa.submitted = true


                GROUP BY qa.id

            ) AS scores
            `
        );


        const averageScore = Math.round(
            Number(
                averageResult.rows[0].average_score || 0
            )
        );


        // Passed attempts
        const passResult = await pool.query(
            `
            SELECT COUNT(*) AS passed

            FROM (

                SELECT

                    qa.id,

                    CASE

                        WHEN COALESCE(
                            SUM(q.points),
                            0
                        ) = 0

                        THEN 0


                        ELSE (
                            qa.score * 100 /
                            SUM(q.points)
                        )

                    END AS percentage


                FROM quiz_attempts qa


                JOIN questions q

                ON q.quiz_id = qa.quiz_id


                WHERE qa.submitted = true


                GROUP BY qa.id


            ) AS results


            WHERE percentage >= 50
            `
        );


        const passed = Number(
            passResult.rows[0].passed
        );


        const passRate = totalAttempts === 0
            ? 0
            : Math.round(
                (passed * 100) / totalAttempts
            );


        const failRate = 100 - passRate;


        res.json({

            totalAttempts,

            averageScore,

            passRate,

            failRate

        });


    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};