var React = require('react');
var ReactDOM = require('react-dom');
var marked = require('marked');
var $ = require("jquery");

var Comment = React.createClass({
	rawMarkup: function () {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
		return {__html: rawMarkup};
	},
	
	render: function () {
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				<span dangerouslySetInnerHTML={this.rawMarkup()}/>
			</div>
		);
	}
});

var CommentList = React.createClass({
	render: function () {
		var commentNodes = this.props.data.map(function (comment) {
			return (
				<Comment author={comment.author} key={comment.id}>
					{comment.text}
				</Comment>
			);
		});
		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

var CommentForm = React.createClass({
	getInitialState: function () {
		return {
			author: '',
			text: ''
		}
	},
	
	handleAuthorChange: function (e) {
		this.setState({author: e.target.value});
	},
	
	handleTextChange: function (e) {
		this.setState({text: e.target.value});
	},
	
	handleSubmit: function (e) {
		e.preventDefault();
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		
		// validation
		if (!text || !author)
			return 0;
		this.props.onCommentSubmit({author: author, text: text});
		this.setState({author: '', text: ''});
	},
	
	render: function () {
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input 
					type="text" 
					placeholder="John Doe"
					value={this.state.author}
					onChange={this.handleAuthorChange}
				/>
				<input 
					type="text" 
					placeholder="Comment here..."
					value={this.state.text}
					onChange={this.handleTextChange}
				/>
				<input type="submit" value="Post"/>
			</form>
		);
	}
});

var CommentBox = React.createClass({
	loadComments: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({data: data['comments']});
			}.bind(this),
			error: function (xhr, status, error) {
				console.error(this.props.url, status, error.toString());
			}.bind(this)
		});
	},
	
	getInitialState: function () {
		return {
			data: []
		};
	},
	
	componentDidMount: function () {
		this.loadComments();
		setInterval(this.loadComments, this.props.pollInterval);
	},
	
	handleCommentSubmit: function (comment) {
		var comments = this.state.data;
		comment.id = Date();
		var newComments = comments.concat([comment]);
		this.setState({data: newComments});
		
		$.ajax({
			url: this.props.url,
			json: true,
			type: 'POST',
			data: JSON.stringify(comment),
    		contentType: "application/json",
			success: function () {
			}.bind(this),
			error: function (xhr, status, error) {
				this.setState({data: comments});
				console.error(this.props.url, status, error.toString());
			}.bind(this)
		});
	},
	
	render: function () {
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data}/>
				<CommentForm onCommentSubmit={this.handleCommentSubmit}/>
			</div>
		);
	}
});
ReactDOM.render(
	<CommentBox url={'/api/comments'} pollInterval={2000}/>,
	document.getElementById('content')
);