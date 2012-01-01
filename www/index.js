$('#events-page').live('pageinit', load_events);
$('#repos-page').live('pageinit', load_repos);

$('#events-refresh').live('click', load_events);
$('#repos-refresh').live('click', load_repos);

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
                if (event.payload.pull_request.merged) {
                    merge_pull_request_event(event);
                } else {
                    open_pull_request_event(event);
                }
            } else {
                console.log(event.type);
            }
        });

        $('#events-list ul').listview('refresh');
    });
}

function push_event(event) {
    var item = $('<li>');

    item.append($('<h3>')
                .append(event.actor.login)
                .append(' pushed to ')
                .append(event.payload.ref)
                .append(' on ')
                .append(event.repo.name));

    $.each(event.payload.commits, function(commit_index, commit) {
        var sha = $('<code>').append(commit.sha.substring(0, 8));

        item.append($('<p>').append(sha).append(' ').append(commit.message));
    });

    $('#events-list ul').append(item);
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