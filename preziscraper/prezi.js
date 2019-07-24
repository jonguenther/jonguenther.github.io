$(document).ready(function(){
    let id = null;
    let slides = [];
    let title = null;
    if(window.mobileAndTabletcheck() == true) alert("This tool currently can only be used if you can export websites as PDF.");
    // on search bar
    $("#search").on("click",function(){
        let url = $('#url').val();
        let apiURL = "https://prezi2pdf.herokuapp.com/proxy/"
        // let apiURL = "http://localhost:3000/proxy/"
        // validate url
        if(url.includes("https://prezi.com") === false){
            return searchError("This is not a valid Prezi URL")
        }
        url = url.split("/");
        if(url[3]=="m") url.splice(3,1);
        if(url[3].length != 12) return searchError("This is not a valid Prezi URL");
        id = url[3];
        title = url[4];

        // validate captcha
        let capdata = grecaptcha.getResponse();
        if(capdata == 0) return searchError("Captcha not validated!");
        else $('#captcha').fadeOut();
        console.log(capdata);
        // request to api
        $.ajax( apiURL + id, {
            type: "POST",
            dataType: 'json',
            data: capdata,
            contentType: "application/json",
        }).done(function( data ) {
            $('#search').prop("disabled",true);
            // set progress bar
            initProgress(24);
            for(i in data.steps){
                n = parseInt(i) + 1;
                slides.push(data.steps[i].images[0].url);
                let html = $.parseHTML("<div class='col' id='box-"+i+"'> <div class='card' style='width: 8rem;margin-bottom:10px' id='slide-"+ i +"'> <div class='card-body'> <p style='font-size:9px;'>Slide #"+n+"</p> <button type='button' class='btn btn-danger btn-sm btn-block del' id='del-"+i+"' >X</button> </div> </div> </div>");
                $('#out').append(html);
                var img = new Image();

                incProgress();
                $(img).addClass("preview card-img-top");
                $(img).attr("id","img-"+i);
                $('#slide-'+i).prepend(img);
                $(img).on('load', function(e){ 
                    statusText("Loading slide " + n);
                });
                img.src=slides[i];
            }

            // show slides
            statusText("done");
            endProgress();
            $('#out').fadeIn();

            // modal option
            $('.preview').on("click",function(e){
                // console.log(id,e.target.id);
                id = e.target.id.split("-");
                id = id[1];
                n = parseInt(id) + 1;
                // console.log(slides[id]);
                $('#modalimg').attr("src",slides[id]);
                $('.mod-del').attr("id","del-"+id);
                $('#exampleModalCenterTitle').text("Slide #"+n);
                $('#exampleModalCenter').modal('show');
            });

            // delete slide
            $('.del').on("click",function(e){
                // console.log(id,e.target.id);
                id = e.target.id.split("-");
                id = id[1];
                $('#exampleModalCenter').modal('hide');
                slides[i] = "not";
                $('#box-'+id).fadeOut();
            });

            // show actions
            $('#convert').fadeIn();
            $('#reset').fadeIn();
        }).fail(function(error){
            searchError("Failed to call Prezi API:");
            console.log(error);
        });
    });

    $('#convert').on("click",function(){
        // var doc = new jsPDF({
        //     orientation: 'landscape',
        //     unit: 'in',
        //     format: [4, 2]
        //     });
        // $("body").fadeOut();'
        // $("body").html("");'
        let out = "";
        for(i in slides){
            if(slides[i] != "not"){
                out+=("<img src='"+slides[i]+"'></br>'");
            }
        }
        var w = window.open();

        var html = "<!DOCTYPE HTML>";
        html += '<html lang="en-us">';
        html += '<head><style></style><title"'+ title +'" Prezi</title></head>';
        html += "<body>";
        html += out;
        html += "</body></html>";
        w.document.write(html);
        w.window.print();
        w.document.close();
    });

    $('#reset').on("click", function () {
        reset();
    });
});

// helper functions
function searchError(text){
    $('#searcherror').text(text);
    $('#searcherror').fadeIn();
    setTimeout(function(){ $('#searcherror').fadeOut(); }, 3000);
}

function initProgress(max){
    $('#progress').fadeIn();
    $('#progressState').attr("aria-valuemax",max);
    $('.progress-bar').css('width', 0+'%').attr('aria-valuenow', 0);   
}

function statusText(text){
    $('#progressText').text(text);
}

function setProgress(progress){
    $('#progressState').attr("aria-valuenow",progress);
}

function incProgress(){
    $('#progressState').attr("aria-valuenow",$('#progressState').prop("aria-valuenow")+1);
    $('.progress-bar').css('width', $('#progressState').prop("aria-valuenow")+1+'%').attr('aria-valuenow', $('#progressState').prop("aria-valuenow")+1);   
}

function endProgress(){
    $('#progress').fadeOut();
    $('progressState').attr("aria-valuenow",0);
}

function reset(){
    $('#search').prop("disabled",false);
    slides = [];
    id = null;
    title = null;
    $('#out').fadeOut().html("");
    $('#captcha').fadeIn();
    $('#convert').fadeOut();
    $('#reset').fadeOut();
    $('.del').unbind();
    $('.preview').unbind();
}

window.mobileAndTabletcheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};