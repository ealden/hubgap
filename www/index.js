$('#news-feed-page').live('pageinit', function() {
    try_exec(blackberry_news_feed_menu);

    load_news_feed();
});

$('#your-actions-page').live('pageinit', function() {
    try_exec(blackberry_your_actions_menu);

    load_your_actions();
});

$('#pull-requests-page').live('pageinit', function() {
    load_pull_requests();
});

$('#repos-page').live('pageinit', function() {
    try_exec(blackberry_repos_menu);

    load_repos();
});

String.prototype.shortlog = function() {
    var n = this.indexOf('\n');

    if (n != -1) {
        return this.substring(0, n);
    } else {
        return this.substring(0);
    }
}

String.prototype.short_sha = function() {
    return this.substring(0, 10);
}

String.prototype.short_date = function() {
    var n = this.indexOf('T');

    if (n != -1) {
        return this.substring(0, n);
    } else {
        return this.substring(0);
    }
}

String.prototype.left_pad = function(n) {
    var padded_string = '';

    for (var x = n; x > this.length; x--) {
        padded_string += '0';
    }

    padded_string += this;

    return padded_string;
}

function try_exec(f) {
    try {
        f()
    } catch(e) {
        console.log(f.name + ' execute failed: ' + e);
    }
}

function load_repos() {
    $.getJSON('https://api.github.com/users/ealden/repos?callback=?', function(data) {
        $('#repo-list ul').empty();

        $.each(data.data, function(index, repo) {
            $('#repo-list ul').append(
                $('<li>').append(
                    $('<a>').attr('href', '#').append(repo.name)));
        });

        $('#repo-list ul').listview('refresh');
    });
}

function load_news_feed() {
    $.getJSON('https://api.github.com/users/ealden/received_events?callback=?', function(data) {
        update_event_list($('#news-feed-list ul'), data.data);
    });
}

function load_your_actions() {
    $.getJSON('https://api.github.com/users/ealden/events?callback=?', function(data) {
        update_event_list($('#your-actions-list ul'), data.data);
    });
}

function load_pull_requests() {
    var container = $('#pull-requests-list ul');

    $.getJSON('https://api.github.com/users/ealden/repos?type=all&callback=?', function(repo_data) {
        $.each(repo_data.data, function(i, repo) {
            $.getJSON('https://api.github.com/repos/' + repo.owner.login + '/' + repo.name + '/pulls?state=closed&callback=?', function(pull_request_data) {
                $.each(pull_request_data.data, function(j, pull_request) {
                    if (pull_request.user.login == 'ealden') {
                        var item = $('<li>');

                        item.append($('<h3>').append(pull_request.title));
                        item.append($('<p>').append(pull_request.body));
                        item.append($('<p>').append($('<em>')
                                                    .append(pull_request.user.login)
                                                    .append(' submitted to ')
                                                    .append(repo.owner.login)
                                                    .append('/')
                                                    .append(repo.name)
                                                    .append(' ')
                                                    .append(pull_request.created_at.short_date())));

                        container.append(item);
                        container.listview('refresh');
                    }
                });
            });
        });
    });
}

function update_event_list(container, data) {
    container.empty();

    var current_date = '';

    $.each(data, function(index, event) {
        if (current_date != event.created_at.short_date()) {
            current_date = event.created_at.short_date();
            container.append($('<li>').attr('data-role','list-divider').append(current_date));
        }

        render_event(container, event);
    });

    container.listview('refresh');
}

function render_event(container, event) {
    switch (event.type) {
    case 'PushEvent':
        push_event(container, event);
        break;
    case 'PullRequestEvent':
        pull_request_event(container, event);
        break;
    case 'IssuesEvent':
        issues_event(container, event);
        break;
    case 'IssueCommentEvent':
        issue_comment_event(container, event);
        break;
    case 'CommitCommentEvent':
        commit_comment_event(container, event);
        break;
    case 'GollumEvent':
        gollum_event(container, event);
        break;
    case 'CreateEvent':
        create_event(container, event);
        break;
    case 'DeleteEvent':
        delete_event(container, event);
        break;
    case 'ForkEvent':
        fork_event(container, event);
        break;
    default:
        unsupported_event(container, event);
    }
}

function unsupported_event(container, event) {
    container.append($('<li>')
                     .append('Unsupported event: ')
                     .append(event.type));
}

function push_event(container, event) {
    var item = $('<li>');

    var ref = event.payload.ref;
    var branch = ref.substring(ref.lastIndexOf('/') + 1);

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' pushed to ')
                .append(branch)
                .append(' on ')
                .append(event.repo.name));

    $.each(event.payload.commits, function(commit_index, commit) {
        var sha = $('<code>').append(commit.sha.short_sha());

        item.append($('<p>')
                    .append(sha)
                    .append(' ')
                    .append(commit.message.shortlog()));
    });

    container.append(item);
}

function pull_request_event(container, event) {
    if (event.payload.pull_request.merged) {
        merge_pull_request_event(container, event);
    } else {
        open_pull_request_event(container, event);
    }
}

function open_pull_request_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' opened pull request ')
                .append(event.payload.number)
                .append(' on ')
                .append(event.repo.name));

    pull_request_event_summary(event, item);

    container.append(item);
}

function merge_pull_request_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' merged pull request ')
                .append(event.payload.number)
                .append(' on ')
                .append(event.repo.name));

    pull_request_event_summary(event, item);

    container.append(item);
}

function pull_request_event_summary(event, item) {
    item.append($('<p>').append(event.payload.pull_request.title));

    var commit_count = event.payload.pull_request.commits;
    var addition_count = event.payload.pull_request.additions;
    var deletion_count = event.payload.pull_request.deletions;

    item.append($('<p>')
                .append(commit_count)
                .append(' ')
                .append((commit_count > 1) ? 'commits' : 'commit')
                .append(' with ')
                .append(addition_count)
                .append(' ')
                .append((addition_count > 1) ? 'additions' : 'addition')
                .append(' and ')
                .append(deletion_count)
                .append(' ')
                .append((deletion_count > 1) ? 'deletions' : 'deletion'));
}

function issues_event(container, event) {
    if (event.payload.action == 'opened') {
        open_issues_event(container, event);
    } else if (event.payload.action == 'closed') {
        close_issues_event(container, event);
    } else if (event.payload.action == 'reopened') {
        reopen_issues_event(container, event);
    } else {
        console.log(event.payload.action);
        unsupported_event(container, event);
    }
}

function close_issues_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' closed issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.issue.title));

    container.append(item);
}

function open_issues_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' opened issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.issue.title));

    container.append(item);
}

function reopen_issues_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' reopened issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.issue.title));

    container.append(item);
}

function issue_comment_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' commented on issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.comment.body));

    container.append(item);
}

function commit_comment_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' commented on ')
                .append(event.repo.name));

    item.append($('<p>')
                .append('Comment in ')
                .append(event.payload.comment.commit_id.short_sha()));

    item.append($('<p>').append(event.payload.comment.body));

    container.append(item);
}

function gollum_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' edited the ')
                .append(event.repo.name)
                .append(' wiki'));

    item.append($('<p>')
                .append('Edited ')
                .append(event.payload.pages[0].title));

    container.append(item);
}

function create_event(container, event) {
    if (event.payload.ref_type == 'branch') {
        create_branch_event(container, event);
    } else if (event.payload.ref_type == 'repository') {
        create_repository_event(container, event);
    } else {
        console.log(event.payload.ref_type);
        unsupported_event(container, event);
    }
}

function create_branch_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' created branch ')
                .append(event.payload.ref)
                .append(' at ')
                .append(event.repo.name));

    container.append(item);
}

function create_repository_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' created repository ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.description));

    container.append(item);
}

function delete_event(container, event) {
    if (event.payload.ref_type == 'branch') {
        delete_branch_event(container, event);
    } else {
        console.log(event.payload.ref_type);
        unsupported_event(container, event);
    }
}

function delete_branch_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' deleted branch ')
                .append(event.payload.ref)
                .append(' at ')
                .append(event.repo.name));

    container.append(item);
}

function fork_event(container, event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' forked ')
                .append(event.repo.name));

    item.append($('<p>')
                .append('Forked repository is at ')
                .append(event.payload.forkee.owner.login + '/' + event.payload.forkee.name));

    container.append(item);
}
