$('#events-page').live('pageinit', function() {
    try_exec(events_menu);

    load_events();
});

$('#repos-page').live('pageinit', function() {
    try_exec(repos_menu);

    load_repos();
});

String.prototype.short_sha = function() {
    return this.substring(0, 10);
}

function try_exec(f) {
    try {
        f()
    } catch(e) {
        console.log(f.name + ' execute failed: ' + e);
    }
}

function events_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_events);
    var menu_separator_1 = new blackberry.ui.menu.MenuItem(true, 1);

    blackberry.ui.menu.clearMenuItems();
    blackberry.ui.menu.addMenuItem(menu_refresh);
    blackberry.ui.menu.addMenuItem(menu_separator_1);
}

function repos_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_repos);
    var menu_separator_1 = new blackberry.ui.menu.MenuItem(true, 1);

    blackberry.ui.menu.clearMenuItems();
    blackberry.ui.menu.addMenuItem(menu_refresh);
    blackberry.ui.menu.addMenuItem(menu_separator_1);
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

function load_events() {
    $.getJSON('https://api.github.com/users/ealden/received_events?callback=?', function(data) {
        $('#events-list ul').empty();

        $.each(data.data, function(index, event) {
            if (event.type == 'PushEvent') {
                push_event(event);
            } else if (event.type == 'PullRequestEvent') {
                pull_request_event(event);
            } else if (event.type == 'IssuesEvent') {
                issues_event(event);
            } else if (event.type == 'IssueCommentEvent') {
                issue_comment_event(event);
            } else if (event.type == 'CommitCommentEvent') {
                commit_comment_event(event);
            } else {
                unsupported_event(event);
            }
        });

        $('#events-list ul').listview('refresh');
    });
}

function unsupported_event(event) {
    $('#events-list ul').append($('<li>')
                                .append('Unsupported event: ')
                                .append(event.type));
}

function push_event(event) {
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

        item.append($('<p>').append(sha).append(' ').append(commit.message));
    });

    $('#events-list ul').append(item);
}

function pull_request_event(event) {
    if (event.payload.pull_request.merged) {
        merge_pull_request_event(event);
    } else {
        open_pull_request_event(event);
    }
}

function open_pull_request_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' opened pull request ')
                .append(event.payload.number)
                .append(' on ')
                .append(event.repo.name));

    pull_request_event_summary(event, item);

    $('#events-list ul').append(item);
}

function merge_pull_request_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' merged pull request ')
                .append(event.payload.number)
                .append(' on ')
                .append(event.repo.name));

    pull_request_event_summary(event, item);

    $('#events-list ul').append(item);
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

function issues_event(event) {
    if (event.payload.action == 'opened') {
        open_issues_event(event);
    } else if (event.payload.action == 'closed') {
        close_issues_event(event);
    }
}

function close_issues_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' closed issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.issue.title));

    $('#events-list ul').append(item);
}

function open_issues_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' opened issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.issue.title));

    $('#events-list ul').append(item);
}

function issue_comment_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' commented on issue ')
                .append(event.payload.issue.number)
                .append(' on ')
                .append(event.repo.name));

    item.append($('<p>').append(event.payload.comment.body));

    $('#events-list ul').append(item);
}

function commit_comment_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' commented on ')
                .append(event.repo.name));

    item.append($('<p>')
                .append('Comment in ')
                .append(event.payload.comment.commit_id.short_sha()));

    item.append($('<p>').append(event.payload.comment.body));

    $('#events-list ul').append(item);
}