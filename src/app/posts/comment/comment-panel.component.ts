import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../post.model';
import { Comment } from '../comment.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-comment-panel',
  templateUrl: './comment-panel.component.html',
  styleUrls: ['./comment-panel.component.css']
})
export class CommentPanelComponent implements OnInit {

  @Input() post: Post;
  @Input() comments: Comment[];

  constructor(private postService: PostService) { }

  ngOnInit() {
  }

  onCommentSaved(event) {
    console.log(event);
    if (event) {
      this.postService.getCommentsOfPost(this.post.id).subscribe((data) => this.comments = data);
    }
  }
}
