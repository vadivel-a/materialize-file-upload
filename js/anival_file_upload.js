(function ($) {

    "use strict";

    $.fn.anivalFileUpload = function(options) {
        /** 
         * Javascript this
         *
         */
        var that = this;


        /** 
         * Jquery DOM element, is set on click
         *
         */
        var $this;

        /**
         * The data to be inserted in the popup
         *
         */
        var data = {};
            data['status'] = false;
            data['selectedFiles'] = {};
        /**
         * Determined type, based on type option (because we have possible value "auto")
         *
         */
        var determinedType;

        /**
         * Different types are supported:
         *
         * "auto"   Will first try "data", then "html" and else it will fail.
         * "data"   Looks at current HTML "data-content" attribute for content
         * "html"   Needs a selector of an existing HTML tag
         *
         */
        var types = [
            ".jpg",
            ".png"
        ];

        /**
         * Default values
         *
         */
        var settings = $.extend({
            selectOption: "multiple",
            fileType:types,
            fileMaxSize:'2MB'

        }, options );

        /**
         * A selector string to filter the descendants of the selected elements that trigger the event.
         *
         */
        var selector = this.selector;

        /**
         * init
         * 
         * Set the onclick event, determine type, validate the settings, set the data and start popup.
         * 
         * @returns {this} 
         */
        function init() {
                $(that).on("change.anivalFileUpload", selector, function(e) {
                        e.preventDefault();
                        var files = event.target.files;
                        for(var i = 0; i< files.length; i++)
                        {
                            validateSettings(files[i]);
                        }                
                        $this = $(this);
                        
                });
                $(settings.beforeUploadFileListing).on('click', '.uploadFileAnival', function() {
                        uploadFile($(this).attr('data-fileid'));
                });
                $(settings.beforeUploadFileListing).on('click', '.deleteFileAnival', function() {
                        removeFile(this);
                });
                $('.uploadMultipleFiles').on('click', function() {
                        uploadMultipleFiles();
                });
                $('.deleteMultipleFiles').on('click', function() {
                        deleteMultipleFiles();
                });                
            return that;
        }
        function uploadMultipleFiles(){
            if(Object.keys(data['selectedFiles']).length != 0  && jQuery('#selectForAll').prop("checked") == true ){
                jQuery.each(data['selectedFiles'], function(id,file){ 
                    uploadFile(id);
                });
            }else{alert('Input box unchecked!');}
        }  
        function deleteMultipleFiles(){
            if((Object.keys(data['selectedFiles']).length != 0) && jQuery('#selectForAll').prop("checked") == true ){
                jQuery(settings.beforeUploadFileListing).html('');
                console.log('true');
            }else{alert('Input box unchecked!');}
        }        
        function removeFile(_this){
            delete data['selectedFiles'][jQuery(_this).closest('tr').attr('id')];
            jQuery(_this).closest('tr').remove();
        }
        function hasExtension(file) {
            return (new RegExp('(' + settings.fileType.join('|').replace(/\./g, '\\.') + ')$')).test(file.name);
        }        

        function validateSettings(file) {
                if(!hasExtension(file)) {
                    data['msg'] = 'Fle type not allowed! Acceptable for '+settings.fileType.join('|');
                }else{
                    appendNewFile(file);
                    data['status'] = true;
                    data['msg'] = 'File type is allowed';
                }  
                return data;
        }
        
        function appendNewFile(file){
                var picReader = new FileReader();
                picReader.addEventListener("load",function(event){
                    var picFile = event.target;
                    var sizeinbytes = file.size;
                    var fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
                    var fSize = sizeinbytes; 
                    var i=0;
                    while(fSize>900){fSize/=1024;i++;}
                    var retsize = (Math.round(fSize*100)/100)+' '+fSExt[i];
                    
                    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                    var uniqid = randLetter + Date.now(); 
                    data['selectedFiles'][uniqid] = file;      
                    
                    var tablerow = '<tr id="'+uniqid+'">';
                        tablerow += '<td width="70px"><img src='+picFile.result+' class="circle responsive-img"></td>';
                        tablerow += '<td><span class="title"><b>'+file.name+'</b></span><span><br>'+retsize+'</span><div class="progress"><div class="determinate" style="width: 0%"></div></div></td>';
                        tablerow += '<td class="action right-align" width="100px"><a href="#!" data-fileid="'+uniqid+'" class="uploadFileAnival btn-floating btn-med waves-effect waves-light upload" ><i class="material-icons">cloud_upload</i></a><a href="#!" data-fileid="'+uniqid+'" class="deleteFileAnival btn-floating btn-med waves-effect waves-light red delete" style="margin-left:5px;"><i class="material-icons">delete</i></a></td>';
                        tablerow += '</tr>';
                    jQuery(settings.beforeUploadFileListing).append(tablerow);
                });
                picReader.readAsDataURL(file);
               
        }
             
        function uploadFile(fileid){
            var file = data['selectedFiles'][fileid];
            var formData = new FormData();
            formData.append('file', file);
                jQuery.ajax({
                    xhr: function() {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = ((evt.loaded / evt.total) * 100);
                                jQuery('#'+fileid+' .determinate').width(percentComplete + '%');
                            }
                        }, false);
                        return xhr;
                    },
                    type: 'POST',
                    url: settings.uploadUrl,
                    data: formData,
                    contentType: false,
                    cache: false,
                    processData:false,
                    beforeSend: function(){
                        jQuery('#'+fileid+' .determinate').width('0%');
                    },
                    error:function(){
                        data['status'] = false;
                        data['msg'] = 'File upload issues try again!';
                    },
                    success: function(resp){
                        if(resp == 'ok'){
                        data['status'] = true;
                        data['msg'] = 'File upload successfully!';
                            jQuery('#'+fileid+' .action a.delete').addClass('disabled scale-transition');
                            jQuery('#'+fileid+' .action a.upload i').text('done');
                            jQuery('#'+fileid+' .action a.upload').attr('onclick','');
                            
                        }else if(resp == 'err'){
                            data['status'] = false;
                            data['msg'] = 'Please select a valid file to upload.'
                        }
                    }
                });
            return;    
        }
        /**
         * Start the plugin
         *
         * @returns {this} 
         */
        return init();
    }
}(jQuery));