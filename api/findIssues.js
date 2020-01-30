const {send} = require('micro')

const octokit = require("@octokit/rest")({
	auth: process.env.GH_AUTH_TOKEN
})
const { URL } = require("url")

const handler = async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const params = url.searchParams
  const org = params.get('org') || 'fastify'
  const labelParam = params.getAll('labels')
  const labels = labelParam.length > 0 ? labelParam : ['help wanted', 'good first issue']
  const includeBody = params.get('includeBody') || false

  const itemSearchResults = (await Promise.all(labels.map(async label => {
	const issues = await octokit.search.issuesAndPullRequests({
		q: `is:issue is:open sort:updated-desc label:"${label}" org:"${org}"`
	})

	return issues.data.items
  })))
  const items = itemSearchResults.flat()

	const dedupeMap = new Map()
  for (let item of items) {
	dedupeMap.set(item.html_url, {
    url: item.html_url,
		title: item.title,
		comments: item.comments,
	  body: includeBody ? item.body : undefined,
  	  author: {
        name: item.user.login,
        avatar_url: item.user.avatar_url,
        acc_url: item.user.html_url
	  },
	  labels: item.labels.map(({name}) => name)
    })
  }

  send(res, 200, { results: Array.from(dedupeMap.values()) })
}

module.exports = handler
