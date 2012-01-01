$('#news-feed-page').live('pageinit', function() {
    try_exec(news_feed_menu);

    load_news_feed();
});

$('#your-actions-page').live('pageinit', function() {
    try_exec(your_actions_menu);

    load_your_actions();
});

$('#repos-page').live('pageinit', function() {
    try_exec(repos_menu);

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

function try_exec(f) {
    try {
        f()
    } catch(e) {
        console.log(f.name + ' execute failed: ' + e);
    }
}

function news_feed_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_news_feed);
    var menu_separator_1 = new blackberry.ui.menu.MenuItem(true, 1);

    blackberry.ui.menu.clearMenuItems();
    blackberry.ui.menu.addMenuItem(menu_refresh);
    blackberry.ui.menu.addMenuItem(menu_separator_1);
}

function your_actions_menu() {
    var menu_refresh = new blackberry.ui.menu.MenuItem(false, 0, "Refresh", load_your_actions);
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

function update_event_list(container, data) {
    container.empty();

    $.each(data, function(index, event) {
        if (event.type == 'PushEvent') {
            push_event(container, event);
        } else if (event.type == 'PullRequestEvent') {
            pull_request_event(container, event);
        } else if (event.type == 'IssuesEvent') {
            issues_event(container, event);
        } else if (event.type == 'IssueCommentEvent') {
            issue_comment_event(container, event);
        } else if (event.type == 'CommitCommentEvent') {
            commit_comment_event(container, event);
        } else if (event.type == 'GollumEvent') {
            gollum_event(container, event);
        } else {
            unsupported_event(container, event);
        }
    });

    container.listview('refresh');
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