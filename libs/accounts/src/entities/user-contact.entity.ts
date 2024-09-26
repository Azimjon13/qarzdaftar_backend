import { IUserContactModel } from '../models/user-contact.model';

export class UserContactEntity implements IUserContactModel {
  id?: number;
  full_name: string;
  customer_id: number;
  author_id: number;

  constructor(userContact: IUserContactModel) {
    this.id = userContact.id;
    this.full_name = userContact.full_name;
    this.author_id = userContact.author_id;
    this.customer_id = userContact.customer_id;
  }
}
