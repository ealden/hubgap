$('#events-page').live('pageinit', load_events);
$('#repos-page').live('pageinit', load_repos);

function load_repos() {
    $.getJSON('https://api.github.com/users/ealden/repos?callback=?', function(data) {
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
        $.each(data.data, function(index, event) {
            if (event.type == 'PushEvent') {
                $('#events-list ul').append(
                    $('<li>').append(event.actor.login));
            } else {
                console.log(event.type);
            }
        });

        $('#events-list ul').listview('refresh');
    });
}