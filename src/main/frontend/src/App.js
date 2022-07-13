'use strict';

import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import when from 'when';
import client from './client';
import follow from './follow'; // function to hop multiple links by "rel"
import stompClient from './websocket-listener';
import { Routes, Route, Link, BrowserRouter as Router } from "react-router-dom";
import Login from "./components/auth/Login";

const root = '/api';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {tabletopSystems: [], attributes: [], page: 1, pageSize: 2, links: {},
		 loggedInAuthor: this.props.loggedInAuthor};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
		this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
		this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
	}

	loadFromServer(pageSize) {
    	follow(client, root, [
            {rel: 'tabletopSystems', params: {size: pageSize}}]
        ).then(tabletopSystemCollection => {
            return client({
                method: 'GET',
                path: tabletopSystemCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                /**
                 * Filter unneeded JSON Schema properties, like uri references and
                 * subtypes ($ref).
                 */
                Object.keys(schema.entity.properties).forEach(function (property) {
                    if (schema.entity.properties[property].hasOwnProperty('format') &&
                        schema.entity.properties[property].format === 'uri') {
                        delete schema.entity.properties[property];
                    }
                    else if (schema.entity.properties[property].hasOwnProperty('$ref')) {
                        delete schema.entity.properties[property];
                    }
                });

                this.schema = schema.entity;
                this.links = tabletopSystemCollection.entity._links;
                return tabletopSystemCollection;
            });
        }).then(tabletopSystemCollection => {
            return tabletopSystemCollection.entity._embedded.tabletopSystems.map(tabletopSystem =>
                    client({
                        method: 'GET',
                        path: tabletopSystem._links.self.href
                    })
            );
        }).then(tabletopSystemPromises => {
            return when.all(tabletopSystemPromises);
        }).done(tabletopSystems => {
            this.setState({
                tabletopSystems: tabletopSystems,
                attributes: Object.keys(this.schema.properties),
                pageSize: pageSize,
                links: this.links
            });
        });
    }

    onCreate(newTabletopSystem) {
    	follow(client, root, ['tabletopSystems']).then(tabletopSystemCollection => {
    		return client({
    			method: 'POST',
    			path: tabletopSystemCollection.entity._links.self.href,
    			entity: newTabletopSystem,
    			headers: {'Content-Type': 'application/json'}
    		})
    	})
//    	.then(response => {
//    		return follow(client, root, [
//    			{rel: 'tabletopSystems', params: {'size': this.state.pageSize}}]);
//    	}).done(response => {
//    		if (typeof response.entity._links.last !== "undefined") {
//    			this.onNavigate(response.entity._links.last.href);
//    		} else {
//    			this.onNavigate(response.entity._links.self.href);
//    		}
//    	});
    }

    onUpdate(tabletopSystem, updatedTabletopSystem) {
        if(tabletopSystem.entity.author.name === this.state.loggedInAuthor) {
            updatedTabletopSystem["author"] = tabletopSystem.entity.author;
            client({
                method: 'PUT',
                path: tabletopSystem.entity._links.self.href,
                entity: updatedTabletopSystem,
                headers: {
                    'Content-Type': 'application/json',
                    'If-Match': tabletopSystem.headers.Etag
                }
            }).done(response => {
                /* Let the websocket handler update the state */
    //    		this.loadFromServer(this.state.pageSize);
            }, response => {
                if (response.status.code === 412) {
                    alert('DENIED: Unable to update ' +
                        tabletopSystem.entity._links.self.href + '. Your copy is stale.');
                }
            });
        } else {
            alert("You are not authorized to update");
        }
    }

	onDelete(tabletopSystem) {
		client({method: 'DELETE', path: tabletopSystem.entity._links.self.href})
		.done(response => {/* let the websocket handle updating the UI */},
		response => {
            if (response.status.code === 403) {
                alert('ACCESS DENIED: You are not authorized to delete ' +
                    tabletopSystem.entity._links.self.href);
            }
		});
	}

	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(tabletopSystemCollection => {
			this.links = tabletopSystemCollection.entity._links;

			return tabletopSystemCollection.entity._embedded.tabletopSystems.map(tabletopSystem =>
					client({
						method: 'GET',
						path: tabletopSystem._links.self.href
					})
			);
		}).then(tabletopSystemPromises => {
			return when.all(tabletopSystemPromises);
		}).done(tabletopSystems => {
			this.setState({
				tabletopSystems: tabletopSystems,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

    refreshAndGoToLastPage(message) {
    	follow(client, root, [{
    		rel: 'tabletopSystems',
    		params: {size: this.state.pageSize}
    	}]).done(response => {
    		if (response.entity._links.last !== undefined) {
    			this.onNavigate(response.entity._links.last.href);
    		} else {
    			this.onNavigate(response.entity._links.self.href);
    		}
    	})
    }

    refreshCurrentPage(message) {
    	follow(client, root, [{
    		rel: 'tabletopSystems',
    		params: {
    			size: this.state.pageSize,
    			page: this.state.page.number
    		}
    	}]).then(tabletopSystemCollection => {
    		this.links = tabletopSystemCollection.entity._links;
    		this.page = tabletopSystemCollection.entity.page;

    		return tabletopSystemCollection.entity._embedded.tabletopSystems.map(tabletopSystem => {
    			return client({
    				method: 'GET',
    				path: tabletopSystem._links.self.href
    			})
    		});
    	}).then(tabletopSystemPromises => {
    		return when.all(tabletopSystemPromises);
    	}).then(tabletopSystems => {
    		this.setState({
    			page: this.page,
    			tabletopSystems: tabletopSystems,
    			attributes: Object.keys(this.schema.properties),
    			pageSize: this.state.pageSize,
    			links: this.links
    		});
    	});
    }

	componentDidMount() {
	    this.loadFromServer(this.state.pageSize);
        stompClient.register([
            {route: '/topic/newTabletopSystem', callback: this.refreshAndGoToLastPage},
            {route: '/topic/updateTabletopSystem', callback: this.refreshCurrentPage},
            {route: '/topic/deleteTabletopSystem', callback: this.refreshCurrentPage}
        ]);
	}

	render() {
		return (
			<div>
				<div className="container mt-3">
                    {/*<Routes>
                        <Route path={"/"}>*/}
                            <div>
                                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                                <TabletopSystemList tabletopSystems={this.state.tabletopSystems}
                                              links={this.state.links}
                                              pageSize={this.state.pageSize}
                                              attributes={this.state.attributes}
                                              onNavigate={this.onNavigate}
                                              onUpdate={this.onUpdate}
                                              onDelete={this.onDelete}
                                              updatePageSize={this.updatePageSize}
                                              loggedInAuthor={this.state.loggedInAuthor}/>
							</div>
						{/*</Route>
                        <Route path="/auth/login"><Login /></Route>
                    </Routes>*/}
                </div>
			</div>
		);
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newTabletopSystem = {};
		this.props.attributes.forEach(attribute => {
			newTabletopSystem[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newTabletopSystem);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = '';
		});

		// Navigate away from the dialog to hide it.
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={attribute} ref={attribute} className="field"/>
			</p>
		);

		return (
			<div>
				<a href="#createTabletopSystem">Create</a>

				<div id="createTabletopSystem" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new tabletop system</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const updatedTabletopSystem = {};
		this.props.attributes.forEach(attribute => {
			updatedTabletopSystem[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.tabletopSystem, updatedTabletopSystem);
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={this.props.tabletopSystem.entity[attribute]}>
				<input type="text" placeholder={attribute}
					   defaultValue={this.props.tabletopSystem.entity[attribute]}
					   ref={attribute} className="field"/>
			</p>
		);

		const dialogId = "updateTabletopSystem-" + this.props.tabletopSystem.entity._links.self.href;

		const isAuthorCorrect = this.props.tabletopSystem.entity.author.name == this.props.loggedInAuthor;

        if (isAuthorCorrect === false) {
            return (
                <div>
                    <a>Not Your Employee ({this.props.loggedInAuthor})</a>
                </div>
            )
		} else {
            return (
                <div key={this.props.tabletopSystem.entity._links.self.href}>
                    <a href={"#" + dialogId}>Update</a>
                    <div id={dialogId} className="modalDialog">
                        <div>
                            <a href="#" title="Close" className="close">X</a>

                            <h2>Update a tabletop system</h2>

                            <form>
                                {inputs}
                                <button onClick={this.handleSubmit}>Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            )
           }
	}

};

class TabletopSystemList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value =
				pageSize.substring(0, pageSize.length - 1);
		}
	}

	handleNavFirst(e){
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

	render() {
//	    const pageInfo = this.props.page.hasOwnProperty("number") ?
//        			<h3>Tabletop Systems - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

		const tabletopSystems = this.props.tabletopSystems.map(tabletopSystem =>
			<TabletopSystem key={tabletopSystem.entity._links.self.href}
			    tabletopSystem={tabletopSystem}
			    attributes={this.props.attributes}
				onUpdate={this.props.onUpdate}
			    onDelete={this.props.onDelete}
			    loggedInAuthor={this.props.loggedInAuthor}/>
		);

		const navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
		}

		return (
			<div>
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				<table>
					<tbody>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Author</th>
							<th></th>
						</tr>
						{tabletopSystems}
					</tbody>
				</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}

class TabletopSystem extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.tabletopSystem);
	}

	render() {
		return (
			<tr>
				<td>{this.props.tabletopSystem.entity.name}</td>
				<td>{this.props.tabletopSystem.entity.description}</td>
				<td>{this.props.tabletopSystem.entity.author.name}</td>
				<td>
                    <UpdateDialog tabletopSystem={this.props.tabletopSystem}
                                  attributes={this.props.attributes}
                                  onUpdate={this.props.onUpdate}
                                  loggedInAuthor={this.props.loggedInAuthor}/>
                </td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}