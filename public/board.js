$(function() {
  let currentBoard = window.location.pathname.slice(3,-1);
  let url = "/api/threads/"+currentBoard;
  $('#boardTitle').text('Welcome to '+window.location.pathname)
  $.ajax({
    type: "GET",
    url: url,
    success: function(data)
    {
      let boardThreads = [];

      console.log('data: ', data);

      data.forEach(function(ele) {
        let thread = [];

        console.log(ele);

        thread.push('<div class="thread">');
        thread.push('<div class="main">');
        thread.push('<p class="id">id: '+ele._id+' ('+ele.created_on+')</p>');
        thread.push('<form id="reportThread"><input type="hidden" name="report_id" value="'+ele._id+'"><input type="submit" value="Report"></form>');
        thread.push('<form id="deleteThread"><input type="hidden" value="'+ele._id+'" name="thread_id" required=""><input type="text" placeholder="password" name="delete_password" required=""><input type="submit" value="Delete"></form>');
        thread.push('<h3>'+ele.text+'</h3>');
        thread.push('</div><div class="replies">');
        let hiddenCount = ele.replycount - 3;
        if (hiddenCount < 1) { hiddenCount = 0 };
	thread.push('<h5>'+ele.replycount+' replies total ('+hiddenCount+' hidden)- <a href="'+window.location.pathname+ele._id+'">See the full thread here</a>.</h5>');
	ele.replies.forEach(function(rep) {
	  thread.push('<div class="reply">')
	  thread.push('<p class="id">id: '+rep._id+' ('+rep.created_on+')</p>');
	  thread.push('<form id="reportReply"><input type="hidden" name="thread_id" value="'+ele._id+'"><input type="hidden" name="reply_id" value="'+rep._id+'"><input type="submit" value="Report"></form>');
	  thread.push('<form id="deleteReply"><input type="hidden" value="'+ele._id+'" name="thread_id" required=""><input type="hidden" value="'+rep._id+'" name="reply_id" required=""><input type="text" placeholder="password" name="delete_password" required=""><input type="submit" value="Delete"></form>');
	  thread.push('<p>'+rep.text+'</p>');
	  thread.push('</div>')
	});
	thread.push('<div class="newReply">')
	thread.push('<form action="/api/replies/'+currentBoard+'/" method="post" id="newReply">');
	thread.push('<input type="hidden" name="thread_id" value="'+ele._id+'">');
	thread.push('<textarea rows="5" cols="80" type="text" placeholder="Quick reply..." name="text" required=""></textarea><br>');
	thread.push('<input type="text" placeholder="password to delete" name="delete_password" required=""><input style="margin-left: 5px" type="submit" value="Submit">')
	thread.push('</form></div></div></div>')
	boardThreads.push(thread.join(''));
      });
      $('#boardDisplay').html(boardThreads.join(''));
    }
  });
  
  $('#newThread').submit(function(){
    $(this).attr('action', "/api/threads/" + currentBoard);
  });
  
  $('#boardDisplay').on('submit','#reportThread', function(e) {
    let url = "/api/threads/"+currentBoard;
    $.ajax({
      type: "PUT",
      url: url,
      data: $(this).serialize(),
      success: function(data) { alert(data) }
    });
    e.preventDefault();
  });
  $('#boardDisplay').on('submit','#reportReply', function(e) {
    const url = "/api/replies/"+currentBoard;
    $.ajax({
      type: "PUT",
      url: url,
      data: $(this).serialize(),
      success: function(data) { alert(data) }
    });
    e.preventDefault();
  });
  $('#boardDisplay').on('submit','#deleteThread', function(e) {
    const url = "/api/threads/"+currentBoard;
    console.log("DELETE " + url + "?" + $(this).serialize());
    $.ajax({
      type: "DELETE",
      url: url,
      data: $(this).serialize(),
      success: function(data) { alert(data) }
    });
    e.preventDefault();
  });        
  $('#boardDisplay').on('submit','#deleteReply', function(e) {
    const url = "/api/replies/" + currentBoard;
    $.ajax({
      type: "DELETE",
      url: url,
      data: $(this).serialize(),
      success: function(data) { alert(data) }
    });
    e.preventDefault();
  });              
});