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