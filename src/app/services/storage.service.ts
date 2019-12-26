import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  /**
   * Get data from storage
   */
  get(key: string): any {
    let value = localStorage.getItem(key);

    //If object or array
    try {
      if (typeof JSON.parse(value) === typeof {} || typeof value === typeof JSON.parse(value))
        value = JSON.parse(value);
    }catch(e){}

    if(value === 'true')
      return true;

    if(value === 'false')
      return false;

    return value;
  }

  /**
   * Get array data from storage
   */
  getArray(key: string): Array<Object> {
    let value = localStorage.getItem(key) as any;
    value = JSON.parse(value) || [];

    return value;
  }

  /**
   * Check if exists
   */
  isExists(key: string): any {
    return (localStorage.getItem(key))? true : false;
  }

  /**
   * Save to storage
   */
  create(key: string, value: any): any {
    //Check if key already exists
    if (this.isExists(key))
      return false;

    //If object or array
    if(typeof value === typeof {} || typeof value === typeof [])
      value = JSON.stringify(value);

    //Set local storage
    localStorage.setItem(key, value);

    return true;
  }

  /**
   * Update storage
   */
  update(key: string, value: any): any {
    //Check if key already exists
    if (!this.isExists(key))
      return false;

    //If object or array
    if (typeof value === typeof {} || typeof value === typeof [])
      value = JSON.stringify(value);

    //Set local storage
    localStorage.setItem(key, value);

    return true;
  }

  /**
   * Save or update storage
   */
  createOrUpdate(key: string, value: any): any {
    if (this.isExists(key))
      this.update(key, value);
    else
      this.create(key, value);
  }

  /**
   * Remove from storage
   */
  destroy(key: string): any {
    //Check if key already exists
    if (!this.isExists(key))
      return false;

    //Remove from local storage
    localStorage.removeItem(key);

    return true;
  }
}
