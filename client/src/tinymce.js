import tinymce from 'tinymce';
import 'tinymce/themes/modern/theme';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/code';
import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/textcolor';

tinymce.init({
	selector: 'textarea',
	theme: 'modern',
	plugins: [
		'image',
		'table',
		'link',
		'lists',
		'code',
		'contextmenu',
		'textcolor',
	],
	toolbar:
		'formatselect | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
	image_advtab: true,
	contextmenu: [
		'undo redo cut copy paste',
		'link image code inserttable',
		'cell row column deletetable',
	].join(' | '),
});
