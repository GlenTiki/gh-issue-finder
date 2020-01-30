import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import styled, { ThemeProvider, keyframes } from 'styled-components'
import queryString from 'query-string'

const Container = styled.div`
	color: ${props => props.theme.dark}
	& > * {
		letter-spacing: normal;
		word-spacing: normal;
	}
`

const Nav = styled.nav`
	display: flex;
	flex-direction: row;
	background-color: ${props => props.theme.darkPrimary};
`
const NavList = styled.ul`
	display: flex;
	flex-direction: row;
	padding: 0;
	margin: 0;
`

const NavLink = styled.li`
	list-style: none;
	padding: 1rem;
	margin: 0 1rem;
`

const CustomisedNavLink = styled(Link)`
	color: ${props => props.theme.light};
	text-decoration: none;
	&:hover {
    text-decoration: underline;
  }
`

const PageTitle = styled.h1`
  text-align: center
`

const Form = styled.form`
	display: flex;
	flex-direction: row;
	justify-content: center;

`

const TextInput = styled.input`
	padding: 1rem;
	margin: .5rem;
	width: 100%;
	max-width: 640px;
	border-radius: 5px;
	border: 2px solid ${props => props.theme.dark};
	color: ${props => props.theme.dark};
	font: 600 1rem system-ui;
`

const Button = styled.button`
	margin: .5rem;
	padding: 1rem;
	background-color: ${props => props.theme.darkPrimary};
	border: 2px solid ${props => props.theme.dark};
	color: ${props => props.theme.light};
	border-radius: 5px;
	font: 600 1rem system-ui;
`

const SearchResultsContainer = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: space-around;
	align-items: stretch;
	align-content: space-between;
	max-width: 100%;
	width: 100%;
`
const SearchResultContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	min-width: 25%;

	flex-wrap: no-wrap;
	flex-shrink: 1;
	border: 2px solid ${props => props.theme.dark};
	border-radius: 5px;
	margin: .5rem;
	width: 100%;
`

const UserAvatar = styled.img`
	max-width: 80px;
	margin: .5rem;
`

const IssueDetails = styled.div`
	display:flex;
	flex-direction: column;

	a {
		color: ${props => props.theme.lightPrimary};
		text-decoration: none;
	}

	a:hover {
		color: ${props => props.theme.primary};
		text-decoration: underline;
	}
`

const IssueTitle = styled.h3`
	margin: .2rem 0;
	text-overflow: ellipsis;
`

const IssueAuthor = styled.p`
	margin: .2rem 0;
`

const FooterComp = styled.footer`
	display: flex;
	flex-align: center;
	justify-content: center;

	a {
		color: ${props => props.theme.lightPrimary};
		text-decoration: none;
	}

	a:hover {
		color: ${props => props.theme.primary};
		text-decoration: underline;
	}
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);

  border-top: 3px solid ${props => props.theme.primary};
  border-right: 3px solid ${props => props.theme.primary};
  border-bottom: 3px solid ${props => props.theme.primary};
  border-left: 3px solid ${props => props.theme.dark};
  background: transparent;
  width: 24px;
  height: 24px;
	border-radius: 50%;
	margin: 0 auto;
`;

const theme = {
	dark: '#05222e',
	darkPrimary: '#0f678a',
	primary: '#19abe6',
	lightPrimary: '#75cdf0',
	light: '#d1eefa'
}

function App() {
  return (
    <Router>
			<ThemeProvider theme={theme}>
        <Nav>
          <NavList>
            <NavLink>
              <CustomisedNavLink to="/">Home</CustomisedNavLink>
            </NavLink>
          </NavList>
        </Nav>

				<Route path="/" component={Home} />

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/search" component={Search} />
        </Switch>

				<Footer />
			</ThemeProvider>
    </Router>
  );
}



function Avatar({ author: {acc_url, avatar_url}}) {
	return <a href={acc_url}><UserAvatar src={avatar_url} alt="user avatar" /></a>
}

function ResultDetails({ title, url, comments, author: { name, acc_url }}) {
	return <IssueDetails>
	  <IssueTitle><a href={url}>{title} ({comments} comments)</a></IssueTitle>
		<IssueAuthor><a href={acc_url}>{name}</a></IssueAuthor>
	</IssueDetails>
}

function Search(props) {
	const search = queryString.parse(props.history.location.search)
	const org = search.org

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const [results, setResults] = useState([])

	useEffect(() => {
		if (!org || org === '') {
			return;
		}
		setLoading(true)
		setError(false)
		setResults([])
		fetch(`/api/findIssues?org=${org}`)
		  .then(res => res.json())
		  .then(({results}) => {
				results.sort((a, b) => b.comments - a.comments)
		  	setLoading(false)
				setResults(results)
		    setError(false)
	    })
			.catch((e) => {
				console.error(e)
		    setError(true)
		  	setLoading(false)
		    setResults([])
			})
	}, [org])


	if (!org || org === '') {
		props.history.replace(`/`);
		return null
	}

	return <Container>
		{ loading ? <Spinner /> : <PageTitle>
			{results.length === 0 ? error ? 'Error finding issues - double check your search query matches the org you want to find!' : 'No Results Found :(' : 'Search results'}
		</PageTitle>}
		<SearchResultsContainer>
			{results.map((result, index) => {
			  return <SearchResultContainer key={index}>
					<Avatar author={result.author} />
					<ResultDetails title={result.title} author={result.author} url={result.url} comments={result.comments} />
			  </SearchResultContainer>
		  })}
		</SearchResultsContainer>
	</Container>
}

function Home(props) {
	const input = React.createRef()

	const search = queryString.parse(props.history.location.search)
	const org = search.org
	useEffect(() => {

		if (org && org !== '') {
			input.current.value = org;
		}
	}, [input, org])

	const submitSearch = (e) => {
		e.preventDefault()
		if (input.current.value === '') return;

		const org = input.current.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/\s]/gi, '')
		input.current.value = org
		props.history.push(`/search?org=${org}`)
	}

	return <Container>
		<PageTitle>Enter a GitHub org to find issues to contribute to...</PageTitle>
		<Form onSubmit={submitSearch}>
			<TextInput type="text" placeholder="Org..." name="org" ref={input} />
			<Button type="submit">Search...</Button>
		</Form>
	</Container>
}

function Footer() {
	return <FooterComp>
		<h2>Made with <span role="img" aria-label="love">❤️</span> for the Open Source Community by <a href="https://twitter.com/GlenTiki">GlenTiki</a></h2>
	</FooterComp>
}

export default App;
