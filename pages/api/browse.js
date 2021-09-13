// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { exec } from "child_process"

export default function handler(req, res) {
    const repoName = req.query.repoName
    const repoUrl = req.query.repoUrl

    exec("helm repo add " + repoName + " " + repoUrl, (error, stdout, stderr) => {
        if (error)
            res.status(500).json({ repo: repoUrl, error: stderr })
        else {
            exec("helm search repo " + repoName + "/ -o json", (error, stdout, stderr) => {
                if (error)
                    res.status(500).json({ repo: repoUrl, error: stderr })
                else {
                    res.status(200).json({ repo: repoUrl, charts: JSON.parse(stdout) })
                }
            })
        }
    })
}
